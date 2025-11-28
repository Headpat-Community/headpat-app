import RelationshipList from "~/components/blocks/relationships/RelationshipList";

export default function FollowersPage() {
	return (
		<RelationshipList
			type="followers"
			title="Followers"
			emptyMessage="You have no followers yet."
		/>
	);
}
