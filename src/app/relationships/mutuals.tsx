import RelationshipList from "~/components/blocks/relationships/RelationshipList";

export default function MutualsPage() {
	return (
		<RelationshipList
			type="mutuals"
			title="Mutuals"
			emptyMessage="You have no mutuals yet. Follow someone to see them here."
		/>
	);
}
