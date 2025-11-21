#!/usr/bin/env bash

if [[ "$1" == "on" ]]; then
  makoctl mode -a do-not-disturb
elif [[ "$1" == "off" ]]; then
  makoctl mode -r do-not-disturb
elif [[ `makoctl mode | grep do-not-disturb` ]]; then
  makoctl mode -r do-not-disturb
else
  makoctl mode -a do-not-disturb
fi

