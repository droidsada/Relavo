# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Relavo is a LinkedIn AI Assistant Chrome Extension frontend. Currently consists of a single React component (`linkedin-message-helper.tsx`) that generates personalized LinkedIn connection messages using the Claude API.

## Current State

This is an early-stage project with only the main React component. There is no build system, package manager configuration, or Chrome extension manifest files yet.

## Technology Stack

- **Framework**: React with TypeScript (TSX)
- **Styling**: Tailwind CSS (utility classes)
- **Icons**: lucide-react (Copy, Check, Loader2, Settings, X)
- **AI Integration**: Anthropic Claude API (claude-sonnet-4-20250514 model)

## Architecture

The component (`LinkedInAIAssistant`) uses React hooks for state management:
- `useState` for API key, settings panel visibility, business context, tone, generated message, loading state, and profile data
- Direct `fetch` calls to Anthropic's Messages API at `https://api.anthropic.com/v1/messages`

Key features:
- Settings panel for API key and customization (business context, message tone)
- Demo profile display (placeholder for actual LinkedIn profile scraping)
- Message generation with copy-to-clipboard functionality

## To Set Up as Full Project

This component needs to be integrated into a React project. Required additions:
1. `package.json` with dependencies: `react`, `lucide-react`, `typescript`
2. `tsconfig.json` for TypeScript configuration
3. Build tooling (Vite, Create React App, or similar)
4. Chrome extension files: `manifest.json`, content script for LinkedIn profile extraction
