#!/usr/bin/env python3
"""
Test script for multi-worker PGN analysis
This script demonstrates how to use the new PGN analyzer with multiple workers
"""

import sys
import os
import json

# Add the python directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pgn_analyzer import analyze_pgn_multithreaded

def test_pgn_analysis():
    """Test the PGN analysis with a sample game"""
    
    # Sample PGN game (short game for testing)
    test_pgn = """[Event "Test Game"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Test White"]
[Black "Test Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1-0"""

    print("🧪 Testing Multi-Worker PGN Analysis")
    print("=" * 50)
    
    try:
        # Test with different worker counts
        for workers in [1, 2, 4]:
            print(f"\n🔍 Testing with {workers} workers...")
            result = analyze_pgn_multithreaded(test_pgn, depth=10, max_workers=workers)
            
            if result["success"]:
                print(f"✅ Analysis completed successfully!")
                print(f"   📊 Total positions: {result['total_positions']}")
                print(f"   ⏱️  Analysis time: {result['analysis_time']} seconds")
                print(f"   👥 Workers used: {result['workers_used']}")
                print(f"   🎯 Depth: {result['depth']}")
                
                # Show first few results
                print(f"   📋 Sample results:")
                for i, (move_num, analysis) in enumerate(result['results'].items()):
                    if i < 3:  # Show first 3 positions
                        if analysis['success']:
                            eval_val = analysis['evaluation']['value']
                            eval_type = analysis['evaluation']['type']
                            print(f"      Move {move_num}: {eval_type} {eval_val} ({analysis['best_move']})")
                        else:
                            print(f"      Move {move_num}: Error - {analysis.get('error', 'Unknown')}")
            else:
                print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
                
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")

def test_system_info():
    """Display system information for optimal worker count"""
    import multiprocessing
    
    print("\n🖥️  System Information")
    print("=" * 30)
    print(f"CPU cores: {multiprocessing.cpu_count()}")
    print(f"Recommended max workers: {min(8, max(1, multiprocessing.cpu_count() - 1))}")

if __name__ == "__main__":
    test_system_info()
    test_pgn_analysis()
    print("\n🎉 Test completed!")
