import CollectionPage from './CollectionPage.jsx'

export default function WatchlistPage() {
  return (
    <CollectionPage
      title="Watchlist"
      scope="watchlist"
      itemNoun="title"
      itemNounPlural="titles"
      emptyBody="Add a title to get started."
      noMatchTitle="No titles match those filters"
    />
  )
}
