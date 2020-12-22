# -*- coding: utf-8 -*-

from setuptools import setup

setup(
    name='pytree',
    version='2.0.0',
    description='potree point cloud profile extractor',
    author='potree',
    author_email='mschuetz@potree.org',
    url='http://www.potree.org',
    install_requires=[
        'Flask'
    ],
    packages=['pytree'],
    include_package_data=True,
    zip_safe=False,
)
