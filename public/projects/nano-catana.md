---
name: Nano-Catana
description: Custom diffusion image models trained on 100k+ cat pictures
type: ML
technologies:
  - Lightning AI
  - Python
  - PyTorch
  - WanDB
  - GPU nodes
github: https://github.com/Padi142/nano-catana
order: 3
---

## TLDR
I have got my hands on a couple of GPUs ranging from NVIDIA L40S to H100s. I have scraped a [dataset](https://huggingface.co/buckets/Padakovec/stuff) of 100k+ cat pictures, annotated them using Qwen llm's and trained a couple of diffusion models from scratch. The models are trained on 512x512 images and can generate high quality cat images. The models are trained using [Lightning AI](https://lightning.ai/) and [PyTorch](https://pytorch.org/). While really silly and not the most useful project, it was an awesome way to learn about image diffusion, training models from scratch and managing training runs across multiple GPU clusters. 

<p align="center">
  <img src="/projects/nano-catana/generated_03.png" alt="Picture of generated cats using Nano Catana 0.1" />
  <br />
  <small>Generated cats using Nano Catana 0.1</small>
</p>

## The why?
