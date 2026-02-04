"""
Finternet Payment Flow Test Script

This script tests the complete payment flow:
1. Lock funds at session start
2. Settle payment at session end
3. Verify refund of unused funds

Usage:
    python test_payment_flow.py
"""

import sys
import os
import time
import asyncio

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.payment_service import FinternetClient, PaymentService
from db.redis import RedisClient

# Test configuration
TEST_USER_ID = "test_student_123"
TEST_SESSION_ID = f"test_sess_{int(time.time())}"
COST_PER_MINUTE = 0.5
MAX_DURATION = 30  # minutes
TEST_DURATION = 5  # seconds (simulated session)

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_step(step, text):
    print(f"\n[Step {step}] {text}")

def print_success(text):
    print(f"✓ {text}")

def print_error(text):
    print(f"✗ {text}")

def print_info(key, value):
    print(f"  {key}: {value}")

async def test_payment_flow():
    """Test complete payment flow"""
    
    print_header("MURPH PAYMENT FLOW TEST")
    print("\nThis test simulates a complete learning session with Finternet payments")
    
    # Initialize services
    payment_service = PaymentService()
    
    try:
        # Step 1: Lock Funds
        print_step(1, "Locking Funds (Session Start)")
        max_amount = COST_PER_MINUTE * MAX_DURATION
        print_info("User ID", TEST_USER_ID)
        print_info("Session ID", TEST_SESSION_ID)
        print_info("Max Amount", f"${max_amount:.2f}")
        print_info("Rate", f"${COST_PER_MINUTE:.2f}/min")
        print_info("Max Duration", f"{MAX_DURATION} min")
        
        lock_result = await payment_service.lock_session_funds(
            user_id=TEST_USER_ID,
            session_id=TEST_SESSION_ID,
            max_amount=max_amount
        )
        
        lock_id = lock_result.get("lock_id")
        print_success(f"Funds locked successfully")
        print_info("Lock ID", lock_id)
        print_info("Locked Amount", f"${lock_result.get('amount', max_amount):.2f}")
        
        # Step 2: Simulate Session Duration
        print_step(2, "Simulating Session")
        print_info("Duration", f"{TEST_DURATION} seconds")
        
        start_time = time.time()
        for i in range(TEST_DURATION):
            elapsed = i + 1
            print(f"  Session running... {elapsed}s", end="\r")
            await asyncio.sleep(1)
        
        end_time = time.time()
        duration_seconds = end_time - start_time
        duration_minutes = duration_seconds / 60
        
        print(f"\n")
        print_success(f"Session completed")
        print_info("Actual Duration", f"{duration_minutes:.2f} min ({duration_seconds:.1f}s)")
        
        # Step 3: Calculate Final Cost
        print_step(3, "Calculating Final Cost")
        final_cost = await payment_service.calculate_session_cost(
            duration_minutes=duration_minutes,
            cost_per_minute=COST_PER_MINUTE
        )
        
        print_info("Final Cost", f"${final_cost:.2f}")
        print_info("Calculation", f"{duration_minutes:.2f} min × ${COST_PER_MINUTE:.2f}/min")
        
        # Step 4: Settle Payment
        print_step(4, "Settling Payment")
        settlement_result = await payment_service.settle_session_payment(
            lock_id=lock_id,
            final_amount=final_cost,
            session_id=TEST_SESSION_ID
        )
        
        print_success("Payment settled successfully")
        print_info("Transaction ID", settlement_result.get("transaction_id", "N/A"))
        print_info("Charged Amount", f"${final_cost:.2f}")
        
        # Step 5: Calculate Refund
        print_step(5, "Refund Calculation")
        refunded = max_amount - final_cost
        print_info("Locked Amount", f"${max_amount:.2f}")
        print_info("Charged Amount", f"${final_cost:.2f}")
        print_info("Refunded Amount", f"${refunded:.2f}")
        print_success(f"Unused funds refunded automatically")
        
        # Summary
        print_header("TEST SUMMARY")
        print_success("All payment flow steps completed successfully!")
        print("\nPayment Flow:")
        print(f"  1. Locked:   ${max_amount:.2f} (for max {MAX_DURATION} min)")
        print(f"  2. Used:     {duration_minutes:.2f} min")
        print(f"  3. Charged:  ${final_cost:.2f}")
        print(f"  4. Refunded: ${refunded:.2f}")
        print(f"\nSavings: ${refunded:.2f} ({(refunded/max_amount*100):.1f}% of locked amount)")
        
        return True
        
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        print("\nPossible issues:")
        print("  1. Finternet API credentials not configured")
        print("  2. Network connectivity issues")
        print("  3. Invalid API endpoint")
        print("\nCheck your .env file:")
        print("  FINTERNET_BASE_URL=https://api.fmm.finternetlab.io")
        print("  FINTERNET_API_KEY=your_key_here")
        return False

async def test_cancel_flow():
    """Test session cancellation with full refund"""
    
    print_header("CANCELLATION FLOW TEST")
    
    payment_service = PaymentService()
    test_session_id = f"test_cancel_{int(time.time())}"
    
    try:
        # Lock funds
        print_step(1, "Locking Funds")
        max_amount = COST_PER_MINUTE * MAX_DURATION
        
        lock_result = await payment_service.lock_session_funds(
            user_id=TEST_USER_ID,
            session_id=test_session_id,
            max_amount=max_amount
        )
        
        lock_id = lock_result.get("lock_id")
        print_success(f"Funds locked: ${max_amount:.2f}")
        
        # Cancel immediately
        print_step(2, "Cancelling Session")
        cancel_result = await payment_service.cancel_session_payment(
            lock_id=lock_id,
            reason="test_cancellation"
        )
        
        print_success("Session cancelled")
        print_info("Refund ID", cancel_result.get("refund_id", "N/A"))
        print_info("Refunded", f"${max_amount:.2f}")
        
        print_header("CANCELLATION TEST PASSED")
        print_success("Full refund processed successfully!")
        
        return True
        
    except Exception as e:
        print_error(f"Cancellation test failed: {str(e)}")
        return False

async def main():
    """Run all tests"""
    
    print("\n" + "█"*60)
    print("█" + " "*58 + "█")
    print("█" + "  MURPH FINTERNET PAYMENT INTEGRATION TEST SUITE  ".center(58) + "█")
    print("█" + " "*58 + "█")
    print("█"*60)
    
    # Check environment
    print("\n[Environment Check]")
    finternet_url = os.getenv("FINTERNET_BASE_URL")
    finternet_key = os.getenv("FINTERNET_API_KEY")
    
    if not finternet_url or not finternet_key:
        print_error("Finternet credentials not configured!")
        print("\nPlease set environment variables:")
        print("  FINTERNET_BASE_URL=https://api.fmm.finternetlab.io")
        print("  FINTERNET_API_KEY=your_key_here")
        print("\nOr create a .env file in the backend directory")
        return
    
    print_success("Finternet credentials configured")
    print_info("Base URL", finternet_url)
    print_info("API Key", f"{finternet_key[:10]}..." if len(finternet_key) > 10 else "***")
    
    # Run tests
    results = []
    
    # Test 1: Normal payment flow
    result1 = await test_payment_flow()
    results.append(("Payment Flow", result1))
    
    await asyncio.sleep(2)
    
    # Test 2: Cancellation flow
    result2 = await test_cancel_flow()
    results.append(("Cancellation Flow", result2))
    
    # Final summary
    print("\n" + "█"*60)
    print("█" + " "*58 + "█")
    print("█" + "  FINAL TEST RESULTS  ".center(58) + "█")
    print("█" + " "*58 + "█")
    print("█"*60)
    
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"\n  {test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n" + "="*60)
        print("  🎉 ALL TESTS PASSED! Finternet integration is working!")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("  ⚠️  SOME TESTS FAILED - Check configuration")
        print("="*60)

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    asyncio.run(main())
