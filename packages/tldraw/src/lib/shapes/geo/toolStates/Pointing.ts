import {
	Box2d,
	GeoShapeGeoStyle,
	StateNode,
	TLEventHandlers,
	TLGeoShape,
	createShapeId,
	getStarBounds,
} from '@tldraw/editor'

export class Pointing extends StateNode {
	static override id = 'pointing'

	override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {
		if (this.editor.inputs.isDragging) {
			const { originPagePoint } = this.editor.inputs

			const id = createShapeId()

			this.editor.mark('creating')

			this.editor.createShapes<TLGeoShape>([
				{
					id,
					type: 'geo',
					x: originPagePoint.x,
					y: originPagePoint.y,
					props: {
						w: 1,
						h: 1,
						geo: this.editor.getStyleForNextShape(GeoShapeGeoStyle),
					},
				},
			])

			this.editor.select(id)
			this.editor.setCurrentTool('select.resizing', {
				...info,
				target: 'selection',
				handle: 'bottom_right',
				isCreating: true,
				creationCursorOffset: { x: 1, y: 1 },
				onInteractionEnd: 'geo',
			})
		}
	}

	override onPointerUp: TLEventHandlers['onPointerUp'] = () => {
		this.complete()
	}

	override onCancel: TLEventHandlers['onCancel'] = () => {
		this.cancel()
	}

	override onComplete: TLEventHandlers['onComplete'] = () => {
		this.complete()
	}

	override onInterrupt: TLEventHandlers['onInterrupt'] = () => {
		this.cancel()
	}

	private complete() {
		const { originPagePoint } = this.editor.inputs

		const id = createShapeId()

		this.editor.mark('creating')

		this.editor.createShapes<TLGeoShape>([
			{
				id,
				type: 'geo',
				x: originPagePoint.x,
				y: originPagePoint.y,
				props: {
					geo: this.editor.getStyleForNextShape(GeoShapeGeoStyle),
					w: 1,
					h: 1,
				},
			},
		])

		const shape = this.editor.getShapeById<TLGeoShape>(id)!
		if (!shape) return

		const bounds =
			shape.props.geo === 'star'
				? getStarBounds(5, 200, 200)
				: shape.props.geo === 'cloud'
				? new Box2d(0, 0, 300, 180)
				: new Box2d(0, 0, 200, 200)
		const delta = this.editor.getDeltaInParentSpace(shape, bounds.center)

		this.editor.select(id)
		this.editor.updateShapes<TLGeoShape>([
			{
				id: shape.id,
				type: 'geo',
				x: shape.x - delta.x,
				y: shape.y - delta.y,
				props: {
					geo: this.editor.getStyleForNextShape(GeoShapeGeoStyle),
					w: bounds.width,
					h: bounds.height,
				},
			},
		])

		if (this.editor.instanceState.isToolLocked) {
			this.parent.transition('idle', {})
		} else {
			this.editor.setCurrentTool('select', {})
		}
	}

	private cancel() {
		this.parent.transition('idle', {})
	}
}
