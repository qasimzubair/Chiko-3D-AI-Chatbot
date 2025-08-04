import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

export const metadata = { title: '3D Chatbot', description: 'Talking avatar' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
