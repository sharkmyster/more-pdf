import { useState } from "react";
import { Grid, Button, List, ListItem, Tabs, Tab, Box } from "@mui/material";

import "./App.css";

type PDF = {
    name: string;
    path: string;
};

const commandList = [
    "toggleClear",
    "toggleYellow",
    "toggleGreen",
    "toggleRed",
    "toggleBlue",
    "toggleStrikethrough",
    "clearAnnotations",
    // "loadAnnotations",
    // "setHighlights",
    // "clearSelection",
    // "saveAnnotations",
    // "pdfFileName",
];

const pdfs: PDF[] = [
    {
        name: "Sample Doc 1",
        path: "/pdfs/SampleDoc1.pdf",
    },
    {
        name: "Sample Doc 2",
        path: "/pdfs/SampleDoc2.pdf",
    },
    {
        name: "Sample Doc 3",
        path: "/pdfs/SampleDoc3.pdf",
    },
];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

function App() {
    const [openDocs, setOpenDocs] = useState<PDF[]>([]);

    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function sendMessage(message: string) {
        const iframe = document.querySelector("iframe");
        iframe?.contentWindow?.postMessage(message, "*");
    }

    return (
        <>
            <Grid
                container
                spacing={2}
                direction={"row"}
                alignItems={"center"}
                className="toolbar"
            >
                <Grid item>PDF Viewer</Grid>

                {commandList.map((command) => {
                    return (
                        <Grid key={command} item>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                    sendMessage(command);
                                }}
                            >
                                {command}
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>

            <Grid container spacing={2} style={{ height: "100%" }}>
                <Grid item xs={2}>
                    <List component="nav">
                        {pdfs.map((pdf, index) => (
                            <ListItem key={index}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                        setOpenDocs((previous) => {
                                            if (
                                                previous?.some(
                                                    (p) => p.name === pdf.name
                                                )
                                            ) {
                                                return previous;
                                            }
                                            return previous
                                                ? [...previous, pdf]
                                                : [pdf];
                                        })
                                    }
                                >
                                    {pdf.name}
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={10} style={{ padding: "20px" }}>
                    {openDocs.length === 0 && <h2>Select a PDF to view</h2>}
                    {openDocs.length >= 1 && (
                        <Box sx={{ width: "100%" }}>
                            <Box
                                sx={{
                                    borderBottom: 1,
                                    borderColor: "divider",
                                }}
                            >
                                <Tabs
                                    value={value}
                                    onChange={handleChange}
                                    aria-label="basic tabs example"
                                >
                                    {openDocs.map((pdf, index) => (
                                        <Tab
                                            key={pdf.name}
                                            label={pdf.name}
                                            {...a11yProps(index)}
                                        />
                                    ))}
                                </Tabs>
                            </Box>
                            {openDocs.map((pdf, index) => (
                                <CustomTabPanel
                                    key={pdf.name}
                                    value={value}
                                    index={index}
                                >
                                    <iframe
                                        title="PDF Viewer"
                                        src={`/pdf-viewer/web/viewer.html?file=${pdf.path}`}
                                        width="600px"
                                        height="700px"
                                    />
                                </CustomTabPanel>
                            ))}
                        </Box>
                    )}
                </Grid>
            </Grid>
        </>
    );
}

export default App;
