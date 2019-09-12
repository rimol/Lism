#pragma once
#include <chrono>
#include <vector>

// StopWatch
class StopWatch {
    using TimePoint = std::chrono::time_point<std::chrono::system_clock>;
    TimePoint start;
    std::vector<TimePoint> timePoints;

public:
    void setTimePoint();
    long long getElapsedTime_millisec(int i);
    StopWatch();
};