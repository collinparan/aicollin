# Taalas AI Progress - March 23, 2026

**Source:** https://taalas.com/the-path-to-ubiquitous-ai/
**Captured:** 2026-03-23 15:00 UTC

## Current Products
- **HC1 Silicon Llama 3.1 8B** - Available now
  - Performance: 17K tokens/sec per user (~10X faster than SOTA)
  - Cost: 20X less to build, 10X less power
  - Uses 3-bit/6-bit quantization (quality degraded vs GPU)
  - Available as chatbot demo (chatjimmy.ai) and API service

## Upcoming Releases (Timeline Confirmed)
1. **Mid-sized reasoning LLM** - Expected Spring 2026 (HC1 platform)
   - Still in labs, will integrate into inference service
   
2. **Frontier LLM** - Expected Winter 2026/2027 (HC2 platform)
   - Second-gen silicon platform
   - Higher density, faster execution
   - Uses standard 4-bit floating-point (addressing quality issues)

## Technical Architecture
- **Total specialization** - Custom silicon per model
- **Merged storage/computation** - Single chip at DRAM density
- **Radical simplification** - No HBM, advanced packaging, liquid cooling

## Company Status
- Founded 2.5 years ago
- 24 team members
- $30M spent of $200M raised
- 2-month model-to-hardware pipeline

## API Access
- Beta service available via application at /api-request-form/
- Target: Enable previously impractical applications via sub-ms latency