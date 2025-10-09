import cron from "node-cron";
import ConnectionRequestModel from "../models/connectionRequest.js";
import { UserInterface } from "../types/dbInterfaces.js";
import { run } from "./ses_sendemail.js";
import { sendPendingRequestEmail } from "./emailBuilder.js";
import { endOfDay, startOfDay, subDays } from "date-fns";
cron.schedule("10 43 18 * * *", async () => {
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

  const listOfEmails = [
    ...new Set(pendingRequests.map((req) => req?.toUserId?.emailId)),
  ];
  // console.log(listOfEmails);
  // const listOfEmails1 = [
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
      if (!seenEmailId.has(toUser.emailId)) {
        seenEmailId.add(toUser.emailId);
        uniqueToUsers.push({
          emailId: toUser.emailId,
          firstName: toUser.firstName,
        });
      }
    });
  console.log(seenEmailId);
  console.log(uniqueToUsers);
  //   for (const email of listOfEmails) {
  //     const res = await sendPendingRequestEmail(email);

  //     console.log(res);
  //   }
});
