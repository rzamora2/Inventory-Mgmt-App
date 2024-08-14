'use client';
import React, { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, Typography, InputAdornment } from "@mui/material";
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip from MUI
import { collection, getDocs, query, setDoc, getDoc, doc, deleteDoc } from "firebase/firestore";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Autocomplete from '@mui/material/Autocomplete';
import { styled, alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import SearchIcon from '@mui/icons-material/Search';

// Styled components for the search bar
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

function PrimarySearchAppBar({ handleOpen, inventory, onSelectItem, setItemName, itemName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Handle Enter key press for search functionality
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const matchedItem = inventory.find(item => item.name.toLowerCase() === itemName.toLowerCase());
      if (matchedItem) {
        onSelectItem(matchedItem);
        handleOpen();
      } else {
        handleOpen(); // Open modal to add a new item
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Replacing Menu Button with Add New Item Button */}
          <Tooltip title="Add New Item">  {/* Tooltip for hover text */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="add new item"
              sx={{ mr: 2 }}
              onClick={handleOpen}  // Opens the modal directly
            >
              <AddCircleIcon />
            </IconButton>
          </Tooltip>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Inventory Management Tool
          </Typography>
          
          <Search>
            <Autocomplete
              id="highlights-demo"
              sx={{ width: 400 }}
              freeSolo  // Allow free text input
              options={inventory.map(item => item.name)}  // Only pass names as options
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              onInputChange={(event, newInputValue) => {
                setItemName(newInputValue); // Update new item name
              }}
              onKeyDown={handleKeyDown} 
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Search or Add Inventory…"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: params.InputProps.endAdornment,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      paddingRight: '48px', 
                      borderRadius: '4px', 
                      backgroundColor: alpha('#fff', 0.15), 
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.25),
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '10px 12px',
                    },
                  }}
                />
              )}
              renderOption={(props, option, { inputValue }) => {
                const { key, ...optionProps } = props;
                const matches = match(option, inputValue, { insideWords: true });
                const parts = parse(option, matches);

                return (
                  <li {...optionProps}>
                    <div>
                      {parts.map((part, index) => (
                        <span
                          key={index}
                          style={{
                            fontWeight: part.highlight ? 700 : 400,
                          }}
                        >
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              }}
              noOptionsText="No matching items. Press Enter to add."
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }

    await updateInventory();
  };
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);  // Function to open the modal
  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null); // Reset selected item
    setItemName(''); // Clear item name
  };

  // Handle selection of item from autocomplete
  const handleSelectItem = (item) => {
    if (item) {
      setSelectedItem(item);  // Set the selected item
      handleOpen();           // Open the modal to display item details
    }
  };

  return (
    <Box 
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ gap: '0px' }} 
    >
      {/* Pass handleSelectItem to PrimarySearchAppBar */}
      <PrimarySearchAppBar
        inventory={inventory}
        onSelectItem={handleSelectItem}
        handleOpen={handleOpen}
        setItemName={setItemName}  // Pass setItemName function
        itemName={itemName}  // Pass itemName state
        setSelectedItem={setSelectedItem} // Reset selected item
      />
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          {selectedItem ? ( // Display selected item details if available
            <>
              <Typography variant="h6">{selectedItem.name}</Typography>
              <Typography variant="body1">Count: {selectedItem.count}</Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(selectedItem.name);
                  }}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(selectedItem.name);
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </>
          ) : (
            // UI for adding a new item if no item is selected
            <>
              <Typography variant="h6">Add New Item</Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Item Name"
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    addItem(itemName);
                    setItemName('');
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Modal>

      {/* Centering Container */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexGrow={1}
      >
        <Box border="2px solid #333" mt={2}>
          <Box
            width="800px"
            height="100px"
            bgcolor="#ADD8E6"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h2" color="#333">
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" height="700px" spacing={2} overflow="auto">
            {inventory.map(({ name, count }) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#f0f0f0"
                padding={5}
              >
                <Typography variant="h3" color="#333" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="#333" textAlign="center">
                  {count}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name);
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name);
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
