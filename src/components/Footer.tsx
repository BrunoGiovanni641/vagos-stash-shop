const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-primary">LOS VAGOS</span>
            <span className="text-muted-foreground font-body">|</span>
            <span className="text-muted-foreground text-sm font-body">
              Loja Oficial
            </span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm font-body">
              © {new Date().getFullYear()} Los Vagos. Todos os direitos reservados.
            </p>
            <p className="text-muted-foreground/60 text-xs font-body mt-1">
              Criado para Low Pixel Roleplay - GTA San Andreas Multiplayer
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
