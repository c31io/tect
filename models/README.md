# Get the local model

## Installation

https://github.com/tensorflow/tfjs/tree/master/tfjs-converter

## The command

Change your working directory to this directory.

Download `biochip.h5` in the release page.

    tensorflowjs_converter --input_format keras .\biochip\saved_model\biochip.h5 .\biochip\web_model\

## The labels

At `.\mobilenet\labels.txt`

    ✊
    🖐
    💧
    ❓

- ✊ clustered
- 🖐 disperse
- 💧 drop wo cell
- ❓ wo drop