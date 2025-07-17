# 💸 CashLite

**CashLite** is a lightweight, minimalistic finance tracker built as a **Progressive Web App (PWA)** with **React**, **TypeScript**, and **Vite**. It helps users track income and expenses with a simple plus/minus system — no signups, no sync, just pure local control.

> 🔥 Inspired by the original CashBook app but designed to be lighter, faster, and focused on essentials. Works on **mobile, desktop, and web** with offline support!

---

## ✨ Features

### 📚 Multi-Book Management
- Create multiple cashbooks for different purposes (Personal, Business, Travel, etc.)
- Organize books into segments/categories for better organization
- Quick book switching and overview dashboard

### 💰 Transaction Management
- Simple **Plus (+)** for income and **Minus (-)** for expenses
- Quick entry with amount, description, and category
- Duplicate transactions across books
- Reverse entries (convert income to expense and vice versa)
- Transfer entries between books

### 🔍 Smart Filtering & Search
- **Date Filters**: Filter by specific dates, months, or years
- **Date Range**: Custom date range selection
- **Text Search**: Search transactions by description or notes
- **Category Filters**: Filter by transaction categories
- **Amount Range**: Filter by transaction amounts

### 📊 Insights & Analytics
- Monthly/yearly summaries per book
- Income vs expense breakdowns
- Category-wise spending analysis
- Segment-wise financial overview
- Balance tracking across all books

### 🎨 User Experience
- **Clean, minimalistic interface**
- **Dark/Light theme support**
- **Offline-first PWA** - works without internet
- **Local data storage** - your data stays on your device
- **Fast performance** - optimized for quick daily use
- **Cross-platform** - works on mobile, desktop, and web
- **Installable** - add to home screen like a native app

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SayefReyadh/CashLite.git
   cd CashLite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - For mobile testing, use your network IP (displayed in terminal)

---

## 🏗️ Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **PWA**: Vite PWA Plugin
- **Routing**: React Router 6
- **State Management**: Zustand
- **Database**: IndexedDB (via Dexie.js)
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library

---

## 📱 PWA Features

### 🔄 Offline Support
- Full functionality without internet connection
- Service worker caches app resources
- Data stored locally in IndexedDB

### 📲 Installation
- **Mobile**: Add to home screen from browser menu
- **Desktop**: Install button in address bar
- **Progressive**: Works in browser or as installed app

### 🔄 Updates
- Automatic background updates
- Notification when new version is available
- Instant updates without app store approval

---

## 📱 Screenshots

*Coming soon...*

---

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── lib/                # Utility functions and configurations
│   ├── db/             # IndexedDB operations
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript definitions
├── constants/          # App constants
└── assets/             # Static assets
```

### Key Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### PWA Development

```bash
# Build and test PWA features
npm run build && npm run preview

# Test offline functionality
# Use browser dev tools > Application > Service Workers
```

---

## 📋 Roadmap

### Phase 1: Core Features ⚡

- [x] Basic project setup with Vite + React
- [x] PWA configuration and service worker
- [ ] Multi-book management
- [ ] Transaction CRUD operations
- [ ] Local IndexedDB database setup
- [ ] Basic filtering and search

### Phase 2: Advanced Features 🚀

- [ ] Book segments/categories
- [ ] Transaction duplication and reversal
- [ ] Advanced filtering (date ranges, amounts)
- [ ] Data export functionality (JSON/CSV)
- [ ] Import from other formats

### Phase 3: Enhancements 💫

- [ ] Dark/light theme with system preference
- [ ] Analytics and insights dashboard
- [ ] Backup and restore functionality
- [ ] Performance optimizations
- [ ] Keyboard shortcuts

### Phase 4: Polish ✨

- [ ] Smooth animations and transitions
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Multi-language support
- [ ] Advanced PWA features (background sync)
- [ ] User onboarding and help system

---

## 🌐 Deployment

### Static Hosting (Recommended)

```bash
# Build for production
npm run build

# Deploy to any static hosting service:
# - Netlify
# - Vercel
# - GitHub Pages
# - Firebase Hosting
```

### PWA Deployment Checklist

- [ ] HTTPS enabled
- [ ] Service worker registered
- [ ] Web app manifest configured
- [ ] Icons for all platforms
- [ ] Offline fallback pages
- [ ] Performance optimizations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the original CashBook app
- Built with love for simple, effective finance tracking
- Thanks to the React, Vite, and PWA communities
- Special thanks to the Shadcn/ui team for beautiful components

---

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact: [your-email@example.com](mailto:your-email@example.com)

---

*Happy tracking! 💸*
*Now available on mobile, desktop, and web!*