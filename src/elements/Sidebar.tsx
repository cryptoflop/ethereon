import Nav from './Nav'

export default function Sidebar() {

  return <aside class='grid grid-rows-[min-content,1fr,min-content] p-4'>
    <div class='p-6 text-3xl select-none mb-8'>
      Ethereon
    </div>

    <Nav />
  </aside>
}