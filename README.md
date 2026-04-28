# SignLang - Pakistan Sign Language (PSL) Learning Platform

SignLang is a web-based application designed to bridge the communication gap for the deaf and hard-of-hearing community in Pakistan. This Final Year Project (FYP) provides an interactive platform to learn and practice Pakistan Sign Language (PSL) using real-time evaluation and feedback.

## 🌟 Purpose & Mission

This project is built with a heartfelt mission: to empower the students of a special education center in Peshawar, Pakistan. In a community where approximately 70% of students rely on sign language, SignLang serves as a vital bridge to education and communication.

Developed in active collaboration with the school's principal and faculty, this platform is tailored to help children master valid Pakistan Sign Language (PSL) gestures directly derived from their course material. By offering interactive lessons and real-time evaluation, we ensure that students not only learn standard PSL signs but also confidently practice and verify their understanding. This project stands as a testament to the power of technology in creating inclusive, accessible, and meaningful educational environments.

![Special Education Complex](./Media/Images/Special%20Education%20Complex.jpg)

## 🚀 Overview

The primary goal of SignLang is to make learning Pakistan Sign Language accessible and effective. The platform uses a Convolutional Neural Network (CNN) to recognize hand gestures and provide instant feedback to users, ensuring they are performing signs correctly.


![Classroom](./Media/Images/Classroom.jpg)
## ✨ Features

- **Interactive Learning**: Real-time evaluation of PSL gestures.
- **User Dashboard**: Track progress and access learning modules.
- **Authentication**: Secure login and registration for personalized learning paths.
- **Machine Learning Integration**: Powered by a custom-trained CNN model for gesture recognition.
- **Responsive Design**: Modern, user-friendly interface built with Next.js.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: CSP / Custom CSS (with Gradient UI)
- **Language**: TypeScript / JavaScript
- **State Management**: React Hooks

### Machine Learning
- **Model**: Convolutional Neural Network (CNN)
- **Tools**: Python, Jupyter Notebooks

### Backend / Services
- **Authentication**: Supabase (integrated via `bcryptjs` and `cookie` handling)
- **Database**: Supabase (inferred from dependencies)

## 📂 Project Structure

The project is organized into the following main directories:

- **`website/`**: The main Next.js web application source code.
  - **`app/`**: Contains the application routes (`page.tsx`, `layout.tsx`), dashboard, and authentication logic.
  - **`my-app/`**: (Experimental) A separate project initialization.
- **`Code/`**: Contains the Machine Learning resources.
  - **`notebooks/`**: Jupyter notebooks for training the PSL recognition model (e.g., `psl_cnn_training.ipynb`).
- **`Documentation/`**: Project documentation and reports.

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Python** (for running ML notebooks)
- **Jupyter Notebook** (or VS Code with Python extension)

### Web Application Setup

1.  Navigate to the `website` directory:
    ```bash
    cd website
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Machine Learning Model

To explore or retrain the model:

1.  Navigate to the `Code/notebooks` directory.
2.  Open `psl_cnn_training.ipynb` in Jupyter Notebook.
3.  Run the cells to see the data processing and training steps.

## 📖 Usage

1.  **Sign Up/Login**: Create an account to save your progress.
2.  **Learn**: Access the learning modules to see demonstrations of PSL signs.
3.  **Practice**: Use your webcam to perform signs. The system will evaluate your gesture and provide feedback.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
