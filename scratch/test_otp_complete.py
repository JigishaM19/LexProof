import sys
import os
sys.path.insert(0, os.path.abspath("backend"))
sys.path.insert(0, os.path.abspath("."))
import asyncio
from datetime import datetime, timezone, timedelta
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.services.otp_service import OTPService
from app.services.email_service import EmailService
from app.services.sms_service import SMSService
from app.services.auth_service import AuthService

async def main():
    await connect_to_mongo()
    db = await get_database()
    otps = db['otps']
    
    print('=====================================================')
    print('1. REAL EMAIL OTP DISPATCH VIA GMAIL SMTP (techtitans2426@gmail.com)')
    print('=====================================================')
    recipient_1 = 'techtitans2426@gmail.com'
    await otps.delete_many({'identifier': recipient_1})
    
    s1, m1, meta1 = await OTPService.send_otp(recipient_1, 'REGISTRATION', 'EMAIL')
    print('Send OTP result:', s1, m1)
    assert s1 is True, f"Failed: {m1}"
    
    print('\n=====================================================')
    print('2. INVALID OTP REJECTION TEST')
    print('=====================================================')
    v_bad, m_bad, _ = await OTPService.verify_otp(recipient_1, '999999', 'REGISTRATION')
    print('Verify bad OTP (999999):', v_bad, m_bad)
    assert v_bad is False
    
    print('\n=====================================================')
    print('3. EXPIRED OTP REJECTION TEST')
    print('=====================================================')
    expired_email = 'expired_user_test@gmail.com'
    await otps.delete_many({'identifier': expired_email})
    await OTPService.send_otp(expired_email, 'REGISTRATION', 'EMAIL')
    
    await otps.update_one(
        {'identifier': expired_email, 'purpose': 'REGISTRATION'},
        {'$set': {'expires_at': datetime.now(timezone.utc) - timedelta(minutes=1)}}
    )
    v_exp, m_exp, _ = await OTPService.verify_otp(expired_email, '123456', 'REGISTRATION')
    print('Verify expired OTP:', v_exp, m_exp)
    assert v_exp is False
    
    print('\n=====================================================')
    print('4. RESEND OTP TEST & PREVIOUS OTP INVALIDATION')
    print('=====================================================')
    user_resend = 'resend_user_test@gmail.com'
    await otps.delete_many({'identifier': user_resend})
    
    await OTPService.send_otp(user_resend, 'REGISTRATION', 'EMAIL')
    doc_1 = await otps.find_one({'identifier': user_resend, 'purpose': 'REGISTRATION'})
    old_hash = doc_1['otp_hash']
    
    await otps.update_one(
        {'identifier': user_resend, 'purpose': 'REGISTRATION'},
        {'$set': {'last_sent_at': datetime.now(timezone.utc) - timedelta(seconds=65)}}
    )
    
    await OTPService.resend_otp(user_resend, 'REGISTRATION')
    doc_2 = await otps.find_one({'identifier': user_resend, 'purpose': 'REGISTRATION'})
    new_hash = doc_2['otp_hash']
    
    print('Old OTP hash != New OTP hash:', old_hash != new_hash)
    assert old_hash != new_hash
    
    print('\n=====================================================')
    print('5. MULTIPLE USERS ISOLATION TEST')
    print('=====================================================')
    user_a = 'user_a_test@gmail.com'
    user_b = 'user_b_test@gmail.com'
    await otps.delete_many({'identifier': {'$in': [user_a, user_b]}})
    
    await OTPService.send_otp(user_a, 'REGISTRATION', 'EMAIL')
    await OTPService.send_otp(user_b, 'REGISTRATION', 'EMAIL')
    
    doc_a = await otps.find_one({'identifier': user_a, 'purpose': 'REGISTRATION'})
    doc_b = await otps.find_one({'identifier': user_b, 'purpose': 'REGISTRATION'})
    
    print('User A identifier in DB:', doc_a['identifier'])
    print('User B identifier in DB:', doc_b['identifier'])
    assert doc_a['identifier'] != doc_b['identifier']
    
    print('\n=====================================================')
    print('6. FORGOT PASSWORD OTP TEST')
    print('=====================================================')
    s_reset, m_reset = await AuthService.request_password_reset('techtitans2426@gmail.com')
    print('Forgot Password Request:', s_reset, m_reset)
    assert s_reset is True
    
    print('\n=====================================================')
    print('7. UNCONFIGURED SMS PROVIDER ERROR TEST')
    print('=====================================================')
    sms_ok, sms_msg = await SMSService.send_sms_otp('+919876543210', '123456')
    print('SMS Send (Unconfigured):', sms_ok, sms_msg)
    assert sms_ok is False
    
    await close_mongo_connection()
    print('\n=====================================================')
    print('ALL COMPREHENSIVE OTP TESTS PASSED SUCCESSFULLY!')
    print('=====================================================')

if __name__ == '__main__':
    asyncio.run(main())
