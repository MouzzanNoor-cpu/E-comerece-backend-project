const sendOTPEmail = async (email, otp) => {
    console.log(`Generated OTP for ${email}: ${otp}`);
    return { success: true, message: 'OTP generated successfully' };
};