cmake_minimum_required(VERSION 3.15)
project(mimicro_core CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Python3 REQUIRED COMPONENTS Interpreter Development)
find_package(pybind11 REQUIRED)

set(CPP_ROOT "${CMAKE_SOURCE_DIR}/../../PROYECTO ESTRUCTURA")

pybind11_add_module(mimicro_core bindings.cpp)

target_include_directories(mimicro_core PRIVATE
    "${CPP_ROOT}/CLASES HECTOR"
    "${CPP_ROOT}/CLASES BRUNO"
    "${CPP_ROOT}/CLASES CRISTHIAN"
    "${CPP_ROOT}/CLASES JAVIER"
    "${CPP_ROOT}/CLASES ROBERTO"
    "${CPP_ROOT}/CLASES SAMUEL"
)

target_compile_options(mimicro_core PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W3 /utf-8>
    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra>
)

install(TARGETS mimicro_core DESTINATION "${CMAKE_SOURCE_DIR}/..")
