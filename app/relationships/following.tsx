import React from 'react'
import RelationshipList from '~/components/blocks/relationships/RelationshipList'

export default function FollowingPage() {
  return (
    <RelationshipList
      type="following"
      title="Following"
      emptyMessage="You don't follow anyone yet."
    />
  )
}
