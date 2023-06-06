import boto3
from botocore.exceptions import ClientError
import json

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",  
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,DELETE"
    }

    image_url = event.get('queryStringParameters', {}).get('image_url', '')
    
    image_name = image_url.split('/')[-1]
    
    bucket_name = 'assingment2-imageuploads'
    
    s3_client = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('object_result')

    s3_exists = False
    dynamodb_exists = False

    try:
        s3_client.head_object(Bucket=bucket_name, Key=image_name)
        s3_exists = True
    except ClientError as e:
        pass
    
    try:
        response = table.get_item(Key={'ImageURL': image_url})
        if 'Item' in response:
            dynamodb_exists = True
    except ClientError as e:
        pass

    if not s3_exists and not dynamodb_exists:
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps('The image does not exist in either S3 or Database.')
        }

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
            'headers': cors_headers,
            'body': json.dumps(response_message)
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps(
                'error: f Error deleting the image from S3 or Database: {e}'
            )
        }
