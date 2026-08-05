<script setup lang="ts">
/*
  Galeria de fotos da atividade.

  Decisões de desenho, para não virar amontoado de imagem:
  - proporção única (4:3) em todas as fotos, com `object-fit: cover` e foco no centro.
    Grade com fotos de alturas diferentes é o que faz uma página parecer improvisada;
  - a primeira foto ocupa duas colunas nas telas largas. Uma imagem de abertura maior
    dá ritmo à grade e evita o efeito de mosaico uniforme;
  - legenda só quando ela acrescenta — legenda que repete o `alt` é ruído para quem
    usa leitor de tela, porque a pessoa ouve a mesma frase duas vezes;
  - sem link, sem lupa, sem sombra ao passar o mouse: a foto não abre nada, então não
    finge ser clicável.
*/
defineProps<{
  titulo: string
  fotos: { arquivo: string; alt: string; legenda?: string }[]
}>()

const id = useId()
</script>

<template>
  <section :aria-labelledby="id" class="galeria-secao">
    <h2 :id="id">{{ titulo }}</h2>
    <ul class="galeria">
      <li v-for="(foto, i) in fotos" :key="foto.arquivo" :class="{ destaque: i === 0 }">
        <figure>
          <img :src="foto.arquivo" :alt="foto.alt" loading="lazy" decoding="async" />
          <figcaption v-if="foto.legenda">{{ foto.legenda }}</figcaption>
        </figure>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.galeria-secao {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}

.galeria {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--e3);
}

.galeria figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  height: 100%;
}

.galeria img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: var(--raio);
  border: var(--borda-largura) solid var(--borda-suave);
  background: var(--superficie);
}

.galeria figcaption {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
  line-height: 1.4;
}

/* A primeira foto abre a grade em tamanho maior, nas telas que comportam. */
@media (min-width: 800px) {
  .galeria {
    grid-template-columns: repeat(3, 1fr);
  }

  .galeria .destaque {
    grid-column: span 2;
    grid-row: span 2;
  }

  .galeria .destaque img {
    aspect-ratio: 3 / 2;
    height: 100%;
  }
}
</style>
