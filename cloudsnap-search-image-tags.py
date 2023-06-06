import json
import boto3
import re

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",  # This allows any origin
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    table = dynamodb.Table('cloudsnap-db')

    # extract the parameters from the event
    parameters = event.get('queryStringParameters', {})

    # Ensure tag and tagcount parameters match and there are no invalid characters in them
    tag_pattern = re.compile("tag[1-9][0-9]*$")
    count_pattern = re.compile("tag[1-9][0-9]*count$")
    numeric_pattern = re.compile("^[0-9]+$")
    alpha_pattern = re.compile("^[a-zA-Z]+$")

    tags = {k: v for k, v in parameters.items() if tag_pattern.match(k)}
    tagcounts = {k: v for k, v in parameters.items() if count_pattern.match(k)}

    if len(tags) != len(tagcounts):
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps('Bad Request: Mismatched number of tags and counts.')
        }

    for tag, value in tags.items():
        if not alpha_pattern.match(value):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps(f'Bad Request: Invalid tag value for {tag}.')
            }

    for tagcount, value in tagcounts.items():
        if not numeric_pattern.match(value):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps(f'Bad Request: Invalid count value for {tagcount}.')
            }

    # convert parameters to the format used in the database
    tags_db_format = [{ "tag": tags[f'tag{i}'], "count": int(tagcounts[f'tag{i}count']) } for i in range(1, len(tags) + 1)]

    # scan the entire table
    response = table.scan()

    matching_image_urls = []

    # iterate through each item
    for item in response['Items']:
        item_tags = item['Tags']
        
        # check if all query parameters are met
        match = all(any(tag_db['tag'] == tag_query['tag'] and tag_db['count'] >= tag_query['count'] for tag_db in item_tags) for tag_query in tags_db_format)

        if match:
            matching_image_urls.append(item['ImageURL'])

    # check if any image matches were found
    if len(matching_image_urls) == 0:
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps('No matching images found.')
        }

    # return the list of image URLs
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps(matching_image_urls)
    }
