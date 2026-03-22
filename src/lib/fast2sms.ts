export async function sendFast2SMSOTP(phoneNumber: string, otp: string): Promise<boolean> {
  const authKey = process.env.FAST2SMS_AUTH_KEY;

  if (!authKey) {
    console.error("FAST2SMS_AUTH_KEY is missing in environment variables.");
    return false;
  }

  // Fast2SMS typically expects just the phone number, without country code if within India.
  // Assuming numbers are Indian, we should remove '+91' or extract the 10 digits.
  // The provided code already handles `phoneNumber` which might include `+91`.
  // Let's remove any non-digit chars and take the last 10 digits to be safe.
  const digits = phoneNumber.replace(/[^0-9]/g, '');
  const formattedNumber = digits.length > 10 ? digits.slice(-10) : digits;

  const url = 'https://www.fast2sms.com/dev/bulkV2';
  const options = {
    method: 'POST',
    headers: {
      'authorization': authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: "otp",
      variables_values: otp,
      schedule_time: "",
      numbers: formattedNumber,
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Fast2SMS returns `return: true` on success
    if (data.return) {
      console.log(`OTP sent successfully to ${phoneNumber} via Fast2SMS.`);
      return true;
    } else {
      console.error(`Failed to send OTP via Fast2SMS:`, data);
      return false;
    }
  } catch (error) {
    console.error('Error sending OTP via Fast2SMS:', error);
    return false;
  }
}
