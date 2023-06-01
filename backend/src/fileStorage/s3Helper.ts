import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class s3Helper {

  static s3: any = new XAWS.S3();
  static bucket: string = process.env.ATTACHMENT_S3_BUCKET;
  static expireTime = parseInt(process.env.SIGNED_URL_EXPIRATION);

  static getPutSignedUrl(todoId: string, contentType: string): string {
    const signedUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucket,
      Key: `${todoId}.png`,
      Expires: this.expireTime,
      ContentType: contentType
    });
    return signedUrl;
  }


  static getReadSignedUrl(todoId: string): string {
    const signedUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: `${todoId}.png`,
      Expires: this.expireTime
    });
    return signedUrl;
  }

}
