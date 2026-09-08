# ShieldShift / GigShield — Phase 4
## Real External Data Integration & Development Documentation

**Phase:** 4 — Real External Data Integration  
**Status:** In Progress / Nearly Complete  
**Documented:** 2026-09-08

---

## 1. Purpose

This document records the Phase 4 development work so the project can be resumed later without reconstructing the implementation history.

It covers:
- objectives and architecture
- Weather API integration
- AQI API integration
- multi-zone scheduled monitoring
- disruption-event creation
- duplicate prevention
- recovery/event closing
- database verification
- problems encountered and solutions
- Dashboard ML integration status
- remaining work
- interview-ready explanation

---

# 2. Phase 4 Objective

The goal of Phase 4 was to replace mock environmental/sensor data with real external data.

### Earlier direction

```text
Mock Sensor API :5001
        |
        +-- rainfall
        +-- AQI
        +-- temperature
        +-- civic event
        |
        v
Backend / ML
```

### Target direction

```text
Real External APIs
        |
        v
Spring Boot Backend
        |
        v
Environmental Monitoring
        |
        v
Disruption Events
        |
        v
MySQL
```

The main real external integrations completed during this phase are:
- Weather API
- OpenWeather Air Pollution API

---

# 3. Technology Context

Relevant services:

```text
React Frontend       :5173
Spring Boot Backend  :8080
Flask ML Service     :5000
MySQL                :3306
Mock Sensor API      :5001   <-- legacy dependency still remaining
```

Spring Boot owns the main application logic, scheduling, external integrations, and database persistence.

Flask owns ML inference.

---

# 4. Architecture Before Phase 4

Environmental data was previously supplied through a mock sensor service:

```text
                 Mock Sensor API :5001
                          |
             +------------+------------+
             |            |            |
          rainfall       AQI       temperature
             |            |            |
             +------------+------------+
                          |
                          v
                    Application / ML
```

This was useful during development but was not real-world data.

---

# 5. Architecture After Core Phase 4 Work

The real monitoring path is now:

```text
                +----------------+
                |   Weather API  |
                +-------+--------+
                        |
                        v
                 WeatherClient
                        |
                        v
              WeatherMonitorService
                        |
                        v
                 DisruptionEvent
                        |
                        v
                       MySQL


                +----------------+
                |     AQI API    |
                +-------+--------+
                        |
                        v
                    AQIClient
                        |
                        v
                AQIMonitorService
                        |
                        v
                 DisruptionEvent
                        |
                        v
                       MySQL
```

Monitoring is multi-zone:

```text
ZoneRepository
     |
     +-- Koramangala
     +-- Whitefield
     +-- Andheri
     +-- Chennai
     |
     v
Scheduled monitoring
```

---

# 6. Weather API Integration

## 6.1 Flow

```text
Zone
 |
 v
WeatherMonitorService
 |
 v
WeatherClient
 |
 v
External Weather API
 |
 v
WeatherResponse
 |
 v
Weather business rules
 |
 v
DisruptionEvent
 |
 v
MySQL
```

The `WeatherClient` isolates HTTP communication with the external service.

The monitoring service contains application-specific rules.

This keeps the integration layer separate from business logic.

---

# 7. Weather Disruption Logic

The current weather monitoring logic creates a `HEAVY_RAIN` disruption when the configured rainfall condition is exceeded.

The implemented event contains information such as:

```text
Event Type  = HEAVY_RAIN
Severity    = 0.85
Data Source = WEATHER_API
Zone        = affected zone
```

The event is persisted in the `disruption_events` table.

---

# 8. Multi-Zone Weather Monitoring

The scheduler reads zones from `ZoneRepository` and checks each zone.

Current intended zones:

```text
Koramangala
Whitefield
Andheri
Chennai
```

Conceptually:

```text
ZoneRepository
      |
      +-- Koramangala -> Weather check
      +-- Whitefield  -> Weather check
      +-- Andheri     -> Weather check
      +-- Chennai     -> Weather check
```

This means the system is no longer limited to one hard-coded location.

---

# 9. Weather Location Problem

During testing, one configured location returned a `404` from the Weather API.

The application-level location:

```text
T Nagar
```

was changed to:

```text
Chennai
```

because the external API successfully recognized the broader city location.

### Lesson

An application zone name and an external API's recognized location name are not necessarily identical. External location identifiers must be tested.

---

# 10. Duplicate Zone Problem

Duplicate zone records were encountered during setup/testing.

A uniqueness constraint was added for zone names:

```text
uk_zone_name
```

The database initialization was also made more tolerant of repeated inserts using an idempotent insertion approach such as:

```sql
INSERT IGNORE
```

### Lesson

Master/reference data should have clear uniqueness constraints.

---

# 11. Weather Scheduler

The project uses Spring scheduling.

The scheduler:
1. obtains all zones
2. iterates through them
3. calls the weather monitoring service
4. handles failures per zone

Spring scheduling is enabled using:

```java
@EnableScheduling
```

### Scheduler testing note

The current development code contains:

```java
@Scheduled(fixedRate = 100000)
```

`100000 ms` equals **100 seconds**, not 10 minutes.

This short interval was useful for development/testing.

Before production, the interval and comment should be aligned with the intended monitoring frequency.

---

# 12. AQI API Integration

The second major Phase 4 integration is the OpenWeather Air Pollution API.

The flow is:

```text
Zone latitude/longitude
        |
        v
     AQIClient
        |
        v
OpenWeather Air Pollution API
        |
        v
    AQIResponse
        |
        v
AQIMonitorService
        |
        v
DisruptionEvent
        |
        v
       MySQL
```

The AQI client uses zone coordinates because the Air Pollution API is queried geographically.

---

# 13. OpenWeather AQI Scale

A critical detail discovered during Phase 4:

OpenWeather's `main.aqi` uses:

```text
1 = Good
2 = Fair
3 = Moderate
4 = Poor
5 = Very Poor
```

The current AQI monitoring logic treats:

```text
AQI >= 4
```

as severe for the purpose of creating `SEVERE_AQI` events.

Severity is currently:

```text
AQI 4 -> 0.80
AQI 5 -> 1.00
```

This is an application-specific disruption rule.

---

# 14. AQI Monitoring Flow

`AQIMonitorService` performs:

```text
1. Find zone
2. Get latitude/longitude
3. Call AQI API
4. Validate response
5. Read AQI
6. Determine severity
7. Check active event
8. Create event if required
```

A severe event contains:

```text
Event Type  = SEVERE_AQI
Data Source = AQI_API
Verified    = true
Severity    = 0.80 or 1.00
TriggeredAt = current time
```

---

# 15. AQI Duplicate Prevention

Repeated scheduler executions must not create repeated active events.

The repository uses a condition equivalent to:

```java
existsByZoneIdAndEventTypeAndEndedAtIsNull(...)
```

Therefore:

```text
First severe AQI check
        |
        v
No active event
        |
        v
Create event

Next check
        |
        v
Active event exists
        |
        v
Do not create another event
```

This makes the monitoring operation effectively idempotent for an ongoing disruption.

---

# 16. AQI Recovery

Recovery logic was added so that an active severe-AQI event does not remain open forever.

The system searches for:

```text
SEVERE_AQI
+
endedAt IS NULL
```

When the current AQI is no longer severe:

```text
Find active event
      |
      v
Set endedAt = current time
      |
      v
Save event
```

This creates the desired lifecycle:

```text
Severe condition
      |
      v
Create event
      |
      v
Active event
      |
      v
Condition returns to normal
      |
      v
Close event
```

---

# 17. Controlled Severe-AQI Test

Real AQI conditions are not guaranteed to be severe during testing.

To test the severe branch, the real value was temporarily replaced with:

```java
int aqi = 5;
```

This forced the severe condition.

The test confirmed:
- scheduler execution
- severe event creation
- multi-zone processing
- duplicate prevention
- MySQL persistence

After the test, the temporary value was removed.

The real implementation was restored to:

```java
int aqi = data.getMain().getAqi();
```

This distinction is important: the hard-coded value was only a controlled test input.

---

# 18. AQI Recovery Test With Real Data

After restoring the real API value, the scheduler received lower AQI values.

The system detected that severe AQI was no longer active and closed the existing events.

The logs showed messages equivalent to:

```text
SEVERE_AQI disruption event closed
```

The MySQL records then contained populated `ended_at` timestamps.

Therefore the following complete flow was verified:

```text
Real AQI
   |
   v
Severe condition
   |
   v
Create event
   |
   v
AQI becomes normal
   |
   v
Close event
```

---

# 19. MySQL Verification

The AQI tests were verified directly in MySQL.

AQI-created events contained:

```text
data_source = AQI_API
```

while active events had:

```text
ended_at = NULL
```

and recovered events had:

```text
ended_at = timestamp
```

The test database also contained older unrelated events such as:

```text
HEAVY_RAIN
EXTREME_HEAT
MANUAL
```

The AQI recovery logic correctly targeted only:

```text
SEVERE_AQI
```

events.

---

# 20. Dashboard AI Risk — Remaining Mock Dependency

The major remaining Phase 4 issue is the Dashboard Risk ML endpoint.

Current flow:

```text
React Dashboard
       |
       v
DashboardService
       |
       v
DashboardRiskRequest
       |
       v
MLClient
       |
       v
Flask /ml/dashboard-risk
       |
       v
Mock Sensor API :5001
       |
       +-- rainfall
       +-- AQI
       +-- temperature
       +-- civic_event
       |
       v
Disruption model
       |
       v
DashboardRiskResponse
```

The current `DashboardRiskRequest` contains:

```text
zone
platform
avgHourlyIncome
avgDailyHours
```

It does not yet contain the environmental values.

Therefore Flask currently fetches those values from port `5001`.

---

# 21. Why Phase 4 Is Not 100% Complete

The real monitoring path is complete for Weather and AQI:

```text
Weather API -> Spring Boot -> DisruptionEvent -> MySQL
AQI API     -> Spring Boot -> DisruptionEvent -> MySQL
```

But the Dashboard Risk path is still:

```text
Dashboard -> Flask -> Mock Sensor API
```

Therefore the mock sensor dependency has not yet been fully removed.

### Current status

```text
Weather integration              COMPLETE
AQI integration                  COMPLETE
Event lifecycle                  COMPLETE
Dashboard real-data migration    PENDING
Mock Sensor removal              PENDING
```

So:

> **Phase 4 is nearly complete, but not fully complete.**

---

# 22. Important AQI / ML Data-Contract Problem

The Dashboard ML code currently uses:

```python
AQI > 150 -> MEDIUM
AQI > 300 -> HIGH
```

and its disruption features are:

```python
DISRUPTION_FEATURES = [
    "rainfall",
    "aqi",
    "temperature",
    "civic_event"
]
```

However, OpenWeather's `main.aqi` is only:

```text
1–5
```

Therefore this would be incorrect:

```text
OpenWeather AQI = 5
        |
        v
Dashboard ML AQI = 5
        |
        v
5 > 150 ? NO
5 > 300 ? NO
        |
        v
LOW
```

The real AQI integration itself is working correctly.

The issue is that the **Dashboard ML model's `aqi` feature uses a different numeric convention**.

Before connecting the two, the model's training data/feature meaning must be checked.

Do not invent an arbitrary conversion.

---

# 23. Civic Event Data — Remaining Question

The disruption model also expects:

```text
civic_event
```

where:

```text
0 = no civic disruption
1 = civic disruption
```

A real external civic-event source has not yet been integrated.

Therefore this is another remaining item for the Dashboard Risk migration.

The project should not claim that this feature is already coming from real external data.

---

# 24. Recommended Final Architecture

The preferred final design is:

```text
             Weather API
                  |
                  v
             WeatherClient
                  |
                  |
             Spring Boot
                  |
                  +------ AQIClient <------ AQI API
                  |
                  v
          Current environmental data
                  |
                  v
        DashboardRiskRequest
                  |
                  v
               MLClient
                  |
                  v
       Flask /ml/dashboard-risk
                  |
                  v
          Disruption ML Model
                  |
                  v
        DashboardRiskResponse
                  |
                  v
              React UI
```

The important principle is:

> Spring Boot should own external data collection; Flask should own ML inference.

This avoids making Flask independently call Weather/AQI APIs that Spring Boot already integrates.

---

# 25. Problems Faced and Solutions

## Problem 1 — Weather location returned 404

**Cause:** External API did not recognize the application zone name.

**Solution:** Changed `T Nagar` to `Chennai`.

**Lesson:** External API location identifiers must be validated.

---

## Problem 2 — Duplicate zone records

**Cause:** Repeated initialization/insertion of the same logical zone.

**Solution:** Unique zone-name constraint plus idempotent insertion.

**Lesson:** Master data needs database-level uniqueness.

---

## Problem 3 — Repeated disruption events

**Cause:** Scheduled monitoring runs repeatedly.

**Solution:** Check for an active event with the same zone and event type before creating another.

**Lesson:** Scheduled monitoring must be idempotent.

---

## Problem 4 — Difficult to test severe AQI

**Cause:** Real AQI might be normal during testing.

**Solution:** Temporarily forced `aqi = 5`, tested the severe branch, then restored the real API value.

**Lesson:** Controlled test inputs are useful for rare branches but must not remain in production code.

---

## Problem 5 — Active events needed recovery

**Cause:** Detection alone does not define when a disruption ends.

**Solution:** Added lookup for active `SEVERE_AQI` events and populated `endedAt` when AQI returned to a non-severe state.

**Lesson:** Monitoring requires both trigger and recovery logic.

---

## Problem 6 — Scheduler interval mismatch

**Cause:** Development interval is `100000 ms`, while the comment says 10 minutes.

**Solution:** Keep short interval during testing; align interval and documentation before production.

---

## Problem 7 — Dashboard still uses mock data

**Cause:** Flask `/ml/dashboard-risk` directly calls port `5001`.

**Solution planned:** Send the required environmental values from Spring Boot to Flask and remove the Flask dependency on the mock sensor service.

---

## Problem 8 — AQI scale mismatch

**Cause:** OpenWeather AQI is 1–5, while the dashboard ML logic uses thresholds 150 and 300.

**Solution planned:** Inspect the disruption-model training data and establish the correct feature contract before changing the input.

---

# 26. Testing Summary

### Weather

```text
API connectivity                 PASS
Multi-zone monitoring             PASS
Weather data retrieval            PASS
Disruption creation               PASS
Weather API data source           PASS
Scheduled execution               PASS
```

### AQI

```text
API connectivity                 PASS
Multi-zone monitoring             PASS
Severe event creation             PASS
Duplicate prevention              PASS
AQI_API data source               PASS
Recovery/event closing             PASS
MySQL verification                PASS
```

### Dashboard Risk

```text
Existing endpoint                WORKING
ML prediction                    WORKING
Real environmental input         NOT YET MIGRATED
Mock Sensor dependency           STILL PRESENT
```

---

# 27. Current Phase 4 Status

| Component | Status |
|---|---|
| Weather API client | DONE |
| Weather monitoring service | DONE |
| Weather scheduler | DONE |
| Multi-zone weather monitoring | DONE |
| Weather disruption events | DONE |
| Weather duplicate prevention | DONE |
| AQI API client | DONE |
| AQI monitoring service | DONE |
| AQI scheduler | DONE |
| Multi-zone AQI monitoring | DONE |
| Severe AQI event creation | DONE |
| AQI duplicate prevention | DONE |
| AQI recovery/event closing | DONE |
| MySQL event verification | DONE |
| Dashboard ML endpoint | EXISTING / WORKING |
| Dashboard real environmental inputs | PENDING |
| AQI-to-dashboard-ML feature contract | PENDING |
| Real civic-event source | PENDING |
| Mock Sensor removal | PENDING |
| Final end-to-end Phase 4 test | PENDING |

---

# 28. Exact Remaining Work

### Step 1 — Inspect disruption-model training

Find the training dataset/script and determine what the `aqi` feature represents.

### Step 2 — Define the dashboard environmental-data contract

Determine the correct values for:

```text
rainfall
aqi/pollution feature
temperature
civic_event
```

### Step 3 — Extend `DashboardRiskRequest`

Add the required environmental fields.

### Step 4 — Update `DashboardService`

Fetch the real data through the Spring Boot integration layer and put it into the ML request.

### Step 5 — Update Flask `/ml/dashboard-risk`

Remove:

```text
localhost:5001
```

and consume the environmental values from the request.

### Step 6 — Test dashboard end-to-end

```text
React
  |
  v
Spring Boot
  |
  +-- Weather API
  +-- AQI API
  |
  v
DashboardRiskRequest
  |
  v
Flask
  |
  v
Disruption Model
  |
  v
Dashboard
```

### Step 7 — Remove mock sensor service

Only after all references are removed and testing passes:

```text
ml/mock_sensor_api.py
```

can be deleted.

Also update any documentation/tests that still reference port `5001`.

### Step 8 — Final Phase 4 verification

Test:
- normal conditions
- heavy rain
- severe AQI
- extreme heat
- multiple zones
- API failure
- duplicate prevention
- recovery
- dashboard response

---

# 29. Current Resume Point

If returning to the project after a break, start here:

```text
PHASE 4
 |
 +-- Weather API ---------------- DONE
 |
 +-- Weather scheduler ---------- DONE
 |
 +-- AQI API -------------------- DONE
 |
 +-- AQI scheduler -------------- DONE
 |
 +-- Event creation ------------- DONE
 |
 +-- Duplicate prevention ------- DONE
 |
 +-- Recovery ------------------- DONE
 |
 +-- MySQL verification --------- DONE
 |
 +-- Dashboard mock migration --- NEXT
 |
 +-- AQI/model contract --------- NEXT
 |
 +-- Civic-event source ---------- NEXT
 |
 +-- Final testing --------------- NEXT
```

**Do not delete `mock_sensor_api.py` yet.**

First complete the Dashboard Risk migration and verify the AQI feature contract.

---

# 30. Interview-Ready Explanation

### Question: What did you implement in Phase 4?

**Answer:**

> "In Phase 4, I replaced the mock environmental monitoring pipeline with real Weather and Air Quality API integrations. I implemented multi-zone scheduled monitoring in Spring Boot, created disruption events based on real environmental conditions, added duplicate active-event prevention, and implemented recovery logic to close disruption events when conditions returned to normal. I verified the complete AQI event lifecycle in MySQL. The remaining work is migrating the Dashboard Risk ML endpoint from the legacy mock sensor feed to the real backend environmental-data pipeline."

### Question: How did you prevent duplicate events?

> "Before creating a disruption event, the backend checks whether an active event already exists for the same zone and event type, using `endedAt IS NULL`. If one exists, it does not create another."

### Question: Why did you implement recovery?

> "Because a disruption is time-bound. When the environmental condition becomes normal, the system needs to close the active event by setting `endedAt`; otherwise the event would remain active indefinitely."

### Question: What important API/model issue did you discover?

> "OpenWeather's `main.aqi` uses a 1–5 scale, while the existing dashboard ML logic uses thresholds such as 150 and 300. Therefore I cannot directly pass the raw OpenWeather AQI into that model without first validating the model's training-data feature definition."

---

# 31. Final Conclusion

Phase 4 has successfully delivered the core real-data monitoring pipeline:

```text
Real Weather API
       +
Real AQI API
       |
       v
Spring Boot
       |
       v
Scheduled Multi-Zone Monitoring
       |
       v
Disruption Events
       |
       v
MySQL
```

The core Weather and AQI integration is **implemented and tested**.

Phase 4 is **not yet fully complete** because the Dashboard Risk ML endpoint still uses the legacy Mock Sensor API.

The next development target is therefore:

```text
Remove Dashboard -> Flask -> Mock Sensor dependency
```

while preserving the correct ML feature semantics.

Once that migration, civic-event handling, cleanup, and final end-to-end testing are complete, Phase 4 can be marked **COMPLETE**.

---

## 32. Phase 5 Starting Point

Phase 5 should begin only after Phase 4 is complete.

The next major area is the payment/policy lifecycle, including the existing Razorpay integration work:

```text
Payment
   |
   v
Payment Verification
   |
   v
Policy Activation
   |
   v
Insurance Lifecycle
```

Do not begin Phase 5 until the Phase 4 Dashboard Risk migration and final testing are finished.
