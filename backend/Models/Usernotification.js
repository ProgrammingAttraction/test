const mongoose =require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipients: {
        type: [String], // Change from String to Array of Strings
        required: true,
      },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentViaEmail: {
      type: Boolean,
      default: false,
    },
    sent_notification_by:{
      type:String,
      default:""
   },
  },
  { timestamps: true }
);

const notification_model=mongoose.model("Notification", NotificationSchema);
module.exports=notification_model;
