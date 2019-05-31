# tiny-s3-uploader
A tiny S3 uploader which doesn't need the fat aws-sdk.
```js
const { S3 } = require("tiny-s3-uploader")
const client = new S3(
    "s3.eu-west-2.amazonaws.com", // The AWS endpoint.
    "ACCESS_KEY_ID_HERE", // The AWS access key ID.
    "SECRET_ACCESS_KEY_HERE", // The AWS secret access key.
    "bucket.example.com", // The AWS bucket.
)

// In a async function...
await client.upload(
    "test.txt", // The key to the file.
    "public-read", // The ACL to the file.
    "binary/octet-stream", // The content type of the file.
    Buffer.from("Hello World!"), // The Buffer to send.
)
```
