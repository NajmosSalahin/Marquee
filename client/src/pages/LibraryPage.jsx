import CollectionPage from './CollectionPage.jsx'
import { READING_STATUS_LABELS } from '../lib/constants.js'

export default function LibraryPage() {
  return (
    <CollectionPage
      title="Library"
      scope="library"
      itemNoun="book or manga"
      itemNounPlural="books & manga"
      emptyBody="Add a book or manga to get started."
      noMatchTitle="No books or manga match those filters"
      statusLabels={READING_STATUS_LABELS}
    />
  )
}
