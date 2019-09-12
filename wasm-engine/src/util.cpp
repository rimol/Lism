#include "util.h"

StopWatch::StopWatch() : start(std::chrono::system_clock::now()) {}

void StopWatch::setTimePoint() {
    timePoints.push_back(std::chrono::system_clock::now());
}

long long StopWatch::getElapsedTime_millisec(int i) {
    return std::chrono::duration_cast<std::chrono::milliseconds>(timePoints[i] - start).count();
}