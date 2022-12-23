# Tect-biochip

➕🟩🔴🤖💾

## Introduction

### ➕ Add a new window

- By the latest size

### 🟩 Get sums on each RGB channels

- On click, the sensor border hides to capture a 2x wider view
- On right click, show the captured view
- ✅ Done, click again to overwrite
- Gamma correction: Q, E

### 🔴 Same, the maximum intensity is 1

- ⭕ Same
- Gamma correction: A, D

### 🤖 AI

- ✊ 0: clustered
- 🖐 1: disperse
- 💧 2: drop wo cell
- ❓ 3: wo drop

### 💾 Append to file

- Save to `$HOME/Documents/Tect/yyyy-mm-dd.csv`
- Right click to change the default path
- It works only when you have ✅⭕ and the predictions by AI

## CSV Schema

Fields are seperated by commas

- Time when append in ISO format
- Window ID
- Sum of R channel from 🟩's left
- Sum of G channel from 🟩's left
- Sum of B channel from 🟩's left
- Sum of R channel from 🟩's right
- Sum of G channel from 🟩's right
- Sum of B channel from 🟩's right
- Width from 🟩 (same width & height of the green border)
- Height from 🟩
- Gamma used in 🟩
- Sum of R channel from 🔴's left
- Sum of G channel from 🔴's left
- Sum of B channel from 🔴's left
- Sum of R channel from 🔴's right
- Sum of G channel from 🔴's right
- Sum of B channel from 🔴's right
- Width from 🔴 (same width & height of the green border)
- Height from 🔴
- Gamma used in 🔴
- Probability of ✊ clustered
- Probability of 🖐 disperse
- Probability of 💧 drop wo cell
- Probability of ❓ wo drop

## Development

Install the dependencies

    yarn install

Test the app

    yarn start

Build packages

    yarn make

## Platforms

Only tested on Windows 11