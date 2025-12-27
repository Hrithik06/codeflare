import {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/config.js";

const readClient = new S3Client({
	region: config.AWS_REGION,
	credentials: {
		accessKeyId: config.S3_READ_KEY,
		secretAccessKey: config.S3_READ_SECRET,
	},
});

const getDownloadUrl = async (key: string) => {
	try {
		const command = new GetObjectCommand({
			Bucket: config.S3_BUCKET,
			Key: key,
		});
		return getSignedUrl(readClient, command, { expiresIn: 60 * 5 });
	} catch (err) {
		console.log("Error connecting S3");
	}
};

const uploadClient = new S3Client({
	region: config.AWS_REGION,
	credentials: {
		accessKeyId: config.S3_UPLOAD_KEY,
		secretAccessKey: config.S3_UPLOAD_SECRET,
	},
});

const getUploadUrl = async (key: string) => {
	try {
		const command = new PutObjectCommand({
			Bucket: config.S3_BUCKET,
			Key: key,
		});
		return getSignedUrl(uploadClient, command, { expiresIn: 60 * 5 });
	} catch (err) {
		console.log("Error connecting S3");
	}
};

export { getDownloadUrl, getUploadUrl };
