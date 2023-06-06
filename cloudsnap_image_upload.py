import json
import boto3
import base64
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",  # This allows any origin
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
    s3 = boto3.client('s3')

    try:
        data = json.loads(event['body'])
        image = data['image']  # your base64 string
        filename = data['filename']  # your filename
        decoded_image = base64.b64decode(image)
        bucket = 'assingment2-imageuploads'  # your s3 bucket name
        s3.put_object(Body=decoded_image, Bucket=bucket, Key=filename, ACL='public-read')

        response = {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(f'Image uploaded successfully to {bucket}/{filename}')
        }
    except (NoCredentialsError, PartialCredentialsError):
        response = {
            'statusCode': 400,
            'headers': cors_headers,
            'body': 'Incorrect AWS configuration'
        }
    except Exception as e:
        response = {
            'statusCode': 500,
            'headers': cors_headers,
            'body': 'Error: ' + str(e)
        }
        
    return response
