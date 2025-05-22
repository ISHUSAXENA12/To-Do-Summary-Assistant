# To-Do-Summary-Assistant
To Do assessment help in managing and reminding of task to be completed on time



A full-stack application that allows users to create and manage personal to-do items, summarize pending to-dos using an LLM, and send the generated summary to a Slack channel.

![Todo Summary Assistant](https://placeholder.svg?height=400&width=800)

## Features

- ✅ Create, edit, and delete to-do items
- ✅ Mark to-dos as completed
- ✅ Filter todos by status (all, pending, completed)
- ✅ Search todos by title, description, or category
- ✅ Add categories, due dates, and priority levels to todos
- ✅ Generate AI summaries of pending to-dos using OpenAI
- ✅ Send summaries to a Slack channel via webhooks
- ✅ Responsive design that works on desktop and mobile

## Tech Stack

- **Frontend**: React, Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API (GPT-4o)
- **Notifications**: Slack Incoming Webhooks
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS with custom animations

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Slack workspace with permission to create webhooks

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/todo-summary-assistant.git
cd todo-summary-assistant
