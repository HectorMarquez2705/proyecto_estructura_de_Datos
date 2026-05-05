"""
Alternativa a CMake: compilar con pip install -e .
Desde la carpeta backend/cpp_core/ ejecutar:
    pip install pybind11
    pip install -e .
El modulo mimicro_core quedara disponible para importar desde backend/.
"""
import os
from setuptools import setup, Extension
import pybind11

cpp_root = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'PROYECTO ESTRUCTURA')
)

ext = Extension(
    'mimicro_core',
    sources=['bindings.cpp'],
    include_dirs=[
        pybind11.get_include(),
        os.path.join(cpp_root, 'CLASES HECTOR'),
        os.path.join(cpp_root, 'CLASES BRUNO'),
        os.path.join(cpp_root, 'CLASES CRISTHIAN'),
        os.path.join(cpp_root, 'CLASES JAVIER'),
        os.path.join(cpp_root, 'CLASES ROBERTO'),
        os.path.join(cpp_root, 'CLASES SAMUEL'),
    ],
    language='c++',
    extra_compile_args=['/std:c++17', '/utf-8'] if os.name == 'nt' else ['-std=c++17'],
)

setup(
    name='mimicro_core',
    version='1.0.0',
    ext_modules=[ext],
)
