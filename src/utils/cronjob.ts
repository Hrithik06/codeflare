import cron from "node-cron";
import ConnectionRequestModel from "../models/connectionRequest.js";
import { UserInterface } from "../types/dbInterfaces.js";
import { sendPendingRequestEmail } from "./emailBuilder.js";
import { endOfDay, startOfDay, subDays } from "date-fns";
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
    }).populate<{ fromUserId: UserInterface; toUserId: UserInterface }>(
      "fromUserId toUserId"
    );

    // const listOfEmails = [
    //   ...new Set(pendingRequests.map((req) => req?.toUserId?.emailId)),
    // ];

    const seenEmailId = new Set();
    interface toUser {
      emailId: string;
      firstName: string;
    }
    const uniqueToUsers: toUser[] = [];

    pendingRequests
      .map((req) => req?.toUserId) //get toUsers only
      .filter((toUser) => {
        //Checking if the Set already has the emailIds
        if (!seenEmailId.has(toUser.emailId)) {
          seenEmailId.add(toUser.emailId);
          uniqueToUsers.push({
            emailId: toUser.emailId,
            firstName: toUser.firstName,
          });
        }
      });

    for (const user of uniqueToUsers) {
      await sendPendingRequestEmail(user.emailId, user.firstName);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
