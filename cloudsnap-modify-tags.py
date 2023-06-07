import json
import boto3
from urllib.parse import parse_qs

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",  # This allows any origin
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }
    try:
        # Parsing the request
        parsed_body = parse_qs(event['body'])
        image_url = parsed_body.get('url')[0]
        
        # Check if action_type is valid (0 or 1)
        if 'type' not in parsed_body or parsed_body.get('type')[0] not in ['0', '1']:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps("Invalid or missing parameter."})
            }

        action_type = int(parsed_body.get('type')[0])  # 1 for add, 0 for remove

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('cloudsnap-db')

        # Fetch the existing item
        try:
            response = table.get_item(Key={'ImageURL': image_url})
        except Exception as e:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps("Error occurred while getting the image: " + str(e))
            }

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps("Image not found.")
            }

        item = response['Item']
        indices_to_remove = []
        for i in range(1, 10): # assuming a maximum of 10 tags
            tag_key = f'tag{i}'
            count_key = f'tag{i}count'
            
            # Check if tag1count parameter is present
            if tag_key in parsed_body:
                if count_key not in parsed_body:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps(f'Missing "{count_key}" parameter.')
                    }
                    
                tag_name = parsed_body[tag_key][0]
                count = int(parsed_body[count_key][0])

                # Search for the tag in the item
                for index, tag in enumerate(item['Tags']):
                    if tag['tag'] == tag_name:
                        if action_type == 1: # Add tag
                            tag['count'] += count
                        elif action_type == 0: # Remove tag
                            tag['count'] = max(0, tag['count'] - count)
                            # If count drops to 0, mark for removal
                            if tag['count'] == 0:
                                indices_to_remove.append(index)
                        break
                else: # If tag was not found in item and we are adding, create new tag
                    if action_type == 1:
                        item['Tags'].append({'tag': tag_name, 'count': count})

        # Remove marked indices, starting from the end to avoid shifting issues
        for index in sorted(indices_to_remove, reverse=True):
            item['Tags'].pop(index)

        # Write back to the database
        try:
            table.put_item(Item=item)
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps('Error occurred while updating the image: ' + str(e))
            }

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps('Successfully updated the tags.')
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps('An unexpected error occurred: ' + str(e))
        }
