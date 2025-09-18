{ pkgs ? import <nixpkgs> { } }:

with pkgs;
mkShell {
  name = "coc-rime";
  buildInputs = [
    librime
    pkg-config
    xmake

    nodejs
    bun
  ];
}
