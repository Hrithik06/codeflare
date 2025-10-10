import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const client = new STSClient({ region: "ap-south-1" });

async function whoAmI() {
  try {
    const command = new GetCallerIdentityCommand({});
    const response = await client.send(command);
    console.log("Using AWS identity:", response);
  } catch (err) {
    console.error("Failed to get identity:", err);
  }
}

// whoAmI();
export { whoAmI };
