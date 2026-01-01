declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: "development" | "production";
		PORT?: string;
		DB_USERNAME?: string;
		DB_PASSWORD?: string;
		DB_CLUSTER?: string;
		ORIGIN?: string;
		JWT_SECRET_KEY?: string;
		BREVO_API_KEY?: string;
		SITE_ADMIN_EMAIL_FOR_BREVO?: string;
		NO_REPLY_BREVO?: string;
		CONTACT_FORM_NO_REPLY_BREVO?: string;
		AWS_REGION?: string;
		S3_BUCKET?: string;
		S3_READ_KEY?: string;
		S3_READ_SECRET?: string;
		S3_UPLOAD_KEY?: string;
		S3_UPLOAD_SECRET?: string;
	}
}
// This gives autocomplete & type safety whenever you access process.env anywhere in your TS code.
