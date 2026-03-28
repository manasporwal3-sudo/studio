# **App Name**: Neuro-Fast

## Core Features:

- Real-time Inventory Display: Provide a live, low-latency view of current stock levels across all quick-commerce SKUs, essential for zero-latency inventory synchronization.
- AI-Powered Demand Forecasting: Utilize real-time sales velocity and advanced AI to predict inventory needs for the next 4 hours, anticipating 'Ghost Stocks' and optimizing stock levels.
- Dynamic Insights Dashboard: A Generative UI, built with Vercel AI SDK, that streams custom UI widgets and alerts based on the urgency and nature of data detected by the AI, highlighting critical inventory insights.
- Automated Procurement Assistant Tool: A generative AI tool designed to suggest optimal restocking orders, facilitating procurement processes by providing actionable insights and future recommendations for autonomous interaction with vendor APIs.
- Rich Data Visualization: Interactive charts, graphs, and maps for visualizing real-time inventory flow, sales trends, predictive analytics, and performance metrics.
- Seamless Mobile Responsiveness: Ensure the application provides an optimal user experience across all devices, adapting layouts and features dynamically for mobile, tablet, and desktop views.
- External Data Synchronization: Integration capabilities to pull real-time sales data, inventory figures, and other operational information from diverse local business systems and vendor APIs.

## Style Guidelines:

- A deep, professional dark theme provides a sophisticated foundation, chosen to minimize eye strain during long periods of data analysis and reflect a high-tech ecosystem.
- Primary action color: A vibrant electric blue (#3B82F6) is used for key interactive elements and data highlights, conveying intelligence, efficiency, and clear calls to action.
- Background color: A highly desaturated deep space blue (#0D1526) serves as the primary canvas, providing strong contrast for content while maintaining a cool, focused ambiance.
- Accent color: A deep indigo (#3A2D9F) adds visual depth and complements the primary blue, offering a subtle, refined highlight in the interface.
- Contextual colors for status: Emerald green (#10B981) for success, amber (#F59E0B) for warnings, and red (#EF4444) for danger signals, ensuring immediate comprehension of inventory health and alerts.
- Text colors: Light slate (#F1F5F9) for primary text, muted slate (#94A3B8) for secondary information, and subtle gray (#64748B) for minor details, ensuring readability across all content tiers.
- Body and headline font: 'Inter' (sans-serif) for its modern, machined, and objective aesthetic, suitable for technical data and a clear hierarchy in dashboards.
- Dashboard layout based on a responsive 12-column grid system, ensuring adaptability and optimal organization across varying screen sizes.
- Cards feature rounded corners (rounded-xl) with subtle borders and box shadows for depth, presenting data segments cleanly and enhancing user focus.
- Consistent spacing and padding (p-6, p-4) are applied throughout the interface for visual harmony and ease of interaction.
- Charts and visualizations (Recharts with a dark theme) utilize blue, green, and amber gradients for intuitive data representation, with dark background tooltips for clarity.
- Leaflet map theme features CartoDB Dark Matter base tiles, with health-indicated colored markers (Green/Yellow/Red) and dark-themed popups for store information; fallback to store cards when map data is unavailable.
- Responsive design with defined breakpoints for mobile (<640px), tablet (640px-1024px), and desktop (>1024px) devices, dynamically adjusting grid layouts for store cards (grid-cols-1, sm:grid-cols-2, lg:grid-cols-3) and full-width charts on mobile.
- Subtle hover states on buttons and cards feature color transitions and lift effects, indicating interactivity and engagement.
- Links display an underline on hover, providing a clear visual cue for navigation.
- Accessibility-focused focus rings for keyboard navigation and border color changes for inputs, enhancing usability.
- Loading states are handled with elegant skeleton loaders, subtle spinners, and progress bars utilizing the blue accent color.
- Error states are visually distinguished with red-accented cards and warning icons, complemented by clear messaging and retry options for network failures.
- Success indicators use green checkmarks and confirmation messages appear via toast notifications for immediate user feedback.
- Smooth transitions are implemented for data updates and UI changes, ensuring a fluid and continuous user experience.