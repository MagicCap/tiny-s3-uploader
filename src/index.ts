import fetch from "node-fetch"
import { sign } from "aws4"
import { createHash } from "crypto"

export class S3 {
    /**
     *Creates an instance of the S3 class.
     * @param {string} [endpoint="s3.eu-west-2.amazonaws.com"] - The endpoint which requests are sent to.
     * @param {string} accessKeyId - The access key ID to use.
     * @param {string} secretAccessKey - The secret access key to use.
     * @param {string} bucketName - The bucket name to use.
     * @memberof S3
     */
    public constructor(
        public endpoint: string = "s3.eu-west-2.amazonaws.com",
        private accessKeyId: string,
        private secretAccessKey: string,
        public bucketName: string
    ) {
        if (!this.endpoint.match(/https:\/\//)) this.endpoint = `https://${this.endpoint}`
    }

    /**
     * Uploads the file specified to the S3 bucket which this class was setup for.
     * @param {string} key - The file key. Per S3 protocol, any slashes will lead into folders.
     * @param {string} [acl="public-read"] - The ACL for the file you are uploading.
     * @param {string} [contentType="binary/octet-stream"] - The MIME type for the content you are uploading.
     * @param {Buffer} content - The content to upload.
     * @memberof S3
     */
    public async upload(key: string, acl: string = "public-read", contentType: string = "binary/octet-stream", content: Buffer): Promise<void> {
        const p = `/${encodeURIComponent(this.bucketName)}/${encodeURIComponent(key)}`
        const url = `${this.endpoint}${p}`
        const hash = createHash("sha256")
        hash.write(content)
        const digest = hash.digest("hex")
        const bufferLen = content.length
        const awsSign = sign({
            host: new URL(this.endpoint).host,
            path: p,
            headers: {
                "X-Amz-Acl": acl,
                "X-Amz-Content-Sha256": digest,
                "Content-Length": bufferLen.toString(),
                "Content-Type": contentType,
            },
            body: content,
            service: "s3",
            method: "PUT",
        }, {
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
        })
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": awsSign.headers.Authorization,
                "X-Amz-Date": awsSign.headers["X-Amz-Date"],
                "Host": awsSign.headers.Host,
                "Content-Length": bufferLen.toString(),
                "Content-Type": contentType,
                "X-Amz-Acl": acl,
                "X-Amz-Content-Sha256": digest,
            },
            body: content,
        })
        if (res.status !== 200) {
            throw new Error(`Failed to upload to S3, status code: ${res.status}`)
        }
    }
}
