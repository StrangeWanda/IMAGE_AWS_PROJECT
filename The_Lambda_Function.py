import base64
import json
import Util
def lambda_handler(event, context):
    try:
        # Decode the image file from the event
        content_type = event['headers']['content-type']
        body = event["body"]
        is_base64_encoded = event.get("isBase64Encoded", False)

        # If the data is Base64-encoded, decode it
        if is_base64_encoded:
            image_data = base64.b64decode(body)
        else:
            image_data = body.encode("utf-8")

        # Process the image
        
        print(f"Received image of size: {len(image_data)} bytes")
        # Respond with a success message
        return {
            "statusCode": 200,
            "body": Util.jsonImageFinal(image_data),
        }

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Error processing image", "error": str(e)}),
        }
