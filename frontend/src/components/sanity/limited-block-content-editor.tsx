import { Box, Stack, Text } from "@sanity/ui";
import { toPlainText } from "next-sanity";
import { useMemo } from "react";
import { PortableTextInputProps, StringInputProps } from "sanity";

export function LimitedBlockContentEditor(
  props: PortableTextInputProps | StringInputProps
) {
  const characterCount = useMemo(
    () =>
      props.value
        ? typeof props.value === "string"
          ? props.value.length
          : toPlainText(props.value).length
        : 0,
    [props.value]
  );

  return (
    <Stack space={2}>
      <Box>{props.renderDefault(props)}</Box>
      <Text size={1}>Characters: {characterCount}</Text>
    </Stack>
  );
}
