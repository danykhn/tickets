export default function Footer() {
  return (
    <footer className="border-t bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 py-6">
        <p className="text-sm text-center">
          © {new Date().getFullYear()} Fer
        </p>
      </div>
    </footer>
  )
}
