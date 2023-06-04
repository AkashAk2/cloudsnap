import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Get the image URL from the event
    image_url = event.get('queryStringParameters', {}).get('image_url', '')
    
    # Get the image name from the URL
    image_name = image_url.split('/')[-1]
    
    # Add your bucket name here
    bucket_name = 'assingment2-imageuploads'
    
    s3_client = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('object_result')

    s3_exists = False
    dynamodb_exists = False

    # Check if the image exists in S3 bucket
    try:
        s3_client.head_object(Bucket=bucket_name, Key=image_name)
        s3_exists = True
    except ClientError as e:
        pass
    
    # Check if the image URL exists in DynamoDB table
    try:
        response = table.get_item(Key={'ImageURL': image_url})
        if 'Item' in response:
            dynamodb_exists = True
    except ClientError as e:
        pass

    if not s3_exists and not dynamodb_exists:
        return {
            'statusCode': 404,
            'body': 'The image does not exist in either S3 or Database.'
        }

    # If the image exists in either S3 or DynamoDB, delete it
    try:
        response_message = 'Successfully deleted the image from'
        
        if s3_exists:
            s3_client.delete_object(Bucket=bucket_name, Key=image_name)
            response_message += ' S3'
        
        if dynamodb_exists:
            table.delete_item(Key={'ImageURL': image_url})
            response_message += ' and Database' if s3_exists else ' Database'
        
        return {
            'statusCode': 200,
            'body': response_message + '.'
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': f'Error deleting the image from S3 or Database: {e}'
        }
