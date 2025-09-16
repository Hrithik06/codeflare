import cron from "node-cron"
import ConnectionRequestModel from "../models/connectionRequest.js"
import { UserInterface } from "../types/dbInterfaces.js"
import { run } from "./ses_sendemail.js"
import { endOfDay, startOfDay, subDays } from "date-fns"
cron.schedule('40 36 18 * * *', async () => {
    // Send reminder emails with all the requests recieved last day at 8AM.
    const yesterday = subDays(new Date(), 1)
    const startOfYesterday = startOfDay(yesterday)
    //const endOfYesterday = endOfDay(yesterday)

    const pendingRequests = await ConnectionRequestModel.find({
        status: "interested",
        createdAt: {
            $gte: startOfYesterday,
            // $lt: endOfYesterday
            $lt: new Date() //till now(whenever this job is triggered say 0800hrs daily)
        }
    }).populate<{ fromUserId: UserInterface, toUserId: UserInterface }>('fromUserId toUserId')

    const listOfEmails = [...new Set(pendingRequests.map((req) => req?.toUserId?.emailId))]

    // listOfEmails.forEach(element => {
    //     run(element, "Pending Connection Request", "You have a pending connection request please login to gittogether.xyz to accept or reject the request.")
    // });

    for (const email of listOfEmails) {
        const res = await run(email, "Pending Connection Request", "You have a pending connection request please login to gittogether.xyz to accept or reject the request.")

        console.log(res)
    }

})
