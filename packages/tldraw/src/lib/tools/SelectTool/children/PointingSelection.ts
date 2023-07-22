import {
	StateNode,
	TLClickEvent,
	TLEventHandlers,
	TLPointerEventInfo,
	getSmallestShapeContainingPoint,
} from '@tldraw/editor'

export class PointingSelection extends StateNode {
	static override id = 'pointing_selection'

	info = {} as TLPointerEventInfo & {
		target: 'selection'
	}

	override onEnter = (info: TLPointerEventInfo & { target: 'selection' }) => {
		this.info = info
	}

	override onPointerUp: TLEventHandlers['onPointerUp'] = (info) => {
		this.editor.selectNone()
		this.parent.transition('idle', info)
	}

	override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {
		if (this.editor.inputs.isDragging) {
			if (this.editor.instanceState.isReadonly) return
			this.parent.transition('translating', info)
		}
	}

	override onDoubleClick?: TLClickEvent | undefined = (info) => {
		const hitShape =
			this.editor.hoveredShape ??
			getSmallestShapeContainingPoint(this.editor, this.editor.inputs.currentPagePoint, {
				hitInside: true,
				exact: true,
			})

		if (hitShape) {
			// todo: extract the double click shape logic from idle so that we can share it here
			this.parent.transition('idle', {})
			this.parent.onDoubleClick?.({
				...info,
				target: 'shape',
				shape: this.editor.getShape(hitShape)!,
			})
			return
		}
	}

	override onCancel: TLEventHandlers['onCancel'] = () => {
		this.cancel()
	}

	override onComplete: TLEventHandlers['onComplete'] = () => {
		this.cancel()
	}

	override onInterrupt = () => {
		this.cancel()
	}

	private cancel() {
		this.parent.transition('idle', {})
	}
}
