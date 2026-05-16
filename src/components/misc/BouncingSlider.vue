<script setup lang="ts">
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring } from "motion-v"
import { onMounted, onUnmounted, ref, watch } from "vue"

interface SliderProps {
	className?: string
	value: number
	min: number
	max: number
	isPlaying?: boolean
	changeOnDrag?: boolean
}

const props = withDefaults(defineProps<SliderProps>(), {
	isPlaying: false,
	changeOnDrag: false,
})

const emit = defineEmits<{
	(e: "change", value: number): void
	(e: "afterChange", value: number): void
	(e: "beforeChange"): void
	(e: "seeking", value: boolean): void
}>()

const MAX_HEIGHT = 20
const MIN_HEIGHT = 8
const INITIAL_INSET = (MAX_HEIGHT - MIN_HEIGHT) / 2

const MAX_BOUNCE_DISTANCE = 12

const containerRef = ref<HTMLElement | null>(null)
const innerRef = ref<HTMLElement | null>(null)

const rectRef = ref<DOMRect | null>(null)

const isDragging = ref(false)
const isHovering = ref(false)

const progressMv = useMotionValue(0)

const insetMv = useMotionValue(INITIAL_INSET)

const bounceX = useSpring(0, {
	damping: 12,
	stiffness: 300,
})

const localTime = ref(props.value)

const clipPath = ref(`inset(${INITIAL_INSET}px 0px round 100px)`)

useMotionValueEvent(insetMv, "change", (latest: number) => {
	clipPath.value = `inset(${latest}px 0px round 100px)`
})

watch(
	() => props.value,
	(v) => {
		if (isDragging.value) return

		localTime.value = v

		const progress = Math.max(
			0,
			Math.min(1, (v - props.min) / (props.max - props.min)),
		)

		progressMv.set(progress)
	},
	{
		immediate: true,
	},
)

let rafId = 0
let lastTime = 0

const updateFrame = (time: number) => {
	if (!lastTime) lastTime = time

	const delta = time - lastTime
	lastTime = time

	if (props.isPlaying && !isDragging.value) {
		localTime.value += delta

		if (localTime.value > props.max) {
			localTime.value = props.max
		}

		const progress = Math.max(
			0,
			Math.min(
				1,
				(localTime.value - props.min) /
					(props.max - props.min),
			),
		)

		progressMv.set(progress)
	}

	rafId = requestAnimationFrame(updateFrame)
}

onMounted(() => {
	rafId = requestAnimationFrame(updateFrame)
})

onUnmounted(() => {
	cancelAnimationFrame(rafId)
})

const expand = () => {
	animate(insetMv, 0, {
		duration: 0.28,
		ease: "easeOut",
	})
}

const collapse = () => {
	animate(insetMv, INITIAL_INSET, {
		type: "spring",
		damping: 12,
		stiffness: 200,
	})
}

const handlePointerDown = (e: PointerEvent) => {
	isDragging.value = true

	rectRef.value = innerRef.value?.getBoundingClientRect() ?? null

	expand()

	emit("beforeChange")
	emit("seeking", true)

	handlePointerMove(e)

	window.addEventListener("pointermove", handlePointerMove)
	window.addEventListener("pointerup", handlePointerUp)
}

const handlePointerMove = (e: PointerEvent) => {
	const rect = rectRef.value
	if (!rect) return

	const relPos = (e.clientX - rect.left) / rect.width

	if (relPos < 0) {
		bounceX.set(Math.tanh(relPos * 2) * MAX_BOUNCE_DISTANCE)
	} else if (relPos > 1) {
		bounceX.set(Math.tanh((relPos - 1) * 2) * MAX_BOUNCE_DISTANCE)
	} else {
		bounceX.set(0)
	}

	const clamped = Math.max(0, Math.min(1, relPos))

	const newValue =
		props.min + clamped * (props.max - props.min)

	localTime.value = newValue

	progressMv.set(clamped)

	if (props.changeOnDrag) {
		emit("change", newValue)
	}
}

const handlePointerUp = () => {
	isDragging.value = false

	rectRef.value = null

	if (isHovering.value) {
		expand()
	} else {
		collapse()
	}

	bounceX.set(0)

	emit("seeking", false)

	emit("change", localTime.value)

	emit("afterChange", localTime.value)

	window.removeEventListener("pointermove", handlePointerMove)
	window.removeEventListener("pointerup", handlePointerUp)
}

const handleClick = (e: MouseEvent) => {
	const rect = innerRef.value?.getBoundingClientRect()

	if (!rect) return

	const relPos = Math.max(
		0,
		Math.min(1, (e.clientX - rect.left) / rect.width),
	)

	const newValue =
		props.min + relPos * (props.max - props.min)

	localTime.value = newValue

	progressMv.set(relPos)

	emit("beforeChange")
	emit("change", newValue)
	emit("afterChange", newValue)
}
</script>

<template>
	<motion.div
		ref="containerRef"
		class="nowPlayingSlider"
		:class="className"
		:style="{
			x: bounceX,
		}"
		@mouseenter="
			() => {
				isHovering = true
				if (!isDragging) expand()
			}
		"
		@mouseleave="
			() => {
				isHovering = false
				if (!isDragging) collapse()
			}
		"
		@pointerdown="handlePointerDown"
		@click="handleClick"
	>
		<div
			ref="innerRef"
			class="inner"
			:style="{
				clipPath,
			}"
		>
			<motion.div
				class="thumb"
				:style="{
					scaleX: progressMv,
					transformOrigin: 'left center',
				}"
			/>
		</div>
	</motion.div>
</template>

<style scoped>
.nowPlayingSlider {
	touch-action: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	min-height: 24px;
	transform: translateZ(0);
}

.inner {
	flex: 1;
	width: 100%;
	height: 20px;
	background-color: #ffffff26;
	overflow: hidden;
	border-radius: 999px;
}

.thumb {
	width: 100%;
	height: 100%;
	background-color: white;
	opacity: 0.6;
	transform-origin: left center;
}
</style>