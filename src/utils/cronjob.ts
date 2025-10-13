import cron from "node-cron";
import ConnectionRequestModel from "../models/connectionRequest.js";
import { UserDocument, BaseEmailRecipient } from "../types/dbInterfaces.js";
import { sendPendingRequestEmail } from "./emailBuilder.js";
import { startOfDay, subDays } from "date-fns";
cron.schedule(
  "00 00 08 * * *",
  async () => {
    // Send reminder emails with all the requests recieved last day at 8AM.
    const yesterday = subDays(new Date(), 1);
    const startOfYesterday = startOfDay(yesterday);
    //const endOfYesterday = endOfDay(yesterday)

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: startOfYesterday,
        // $lt: endOfYesterday
        $lt: new Date(), //till now(whenever this job is triggered say 0800hrs daily)
      },
    }).populate<{ fromUserId: UserDocument; toUserId: UserDocument }>(
      "fromUserId toUserId"
    );

    // const listOfEmails = [
    //   ...new Set(pendingRequests.map((req) => req?.toUserId?.emailId)),
    // ];

    const seenEmailId = new Set();

    const uniqueToUsers: BaseEmailRecipient[] = [];

    pendingRequests
      .map((req) => req?.toUserId) //get toUsers only
      .filter((toUser) => {
        //Checking if the Set already has the emailIds
        if (!seenEmailId.has(toUser.emailId)) {
          console.log(typeof toUser._id);
          seenEmailId.add(toUser.emailId);
          uniqueToUsers.push({
            emailId: toUser.emailId,
            firstName: toUser.firstName,
            lastName: toUser.lastName,
          });
        }
      });

    for (const user of uniqueToUsers) {
      await sendPendingRequestEmail({
        emailId: user.emailId,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
